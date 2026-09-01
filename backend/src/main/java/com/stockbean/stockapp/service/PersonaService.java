package com.stockbean.stockapp.service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.stockbean.stockapp.model.tablas.Persona;
import com.stockbean.stockapp.repository.PersonaRepository;
import com.stockbean.stockapp.model.admin.PersonaEmpresa;
import com.stockbean.stockapp.model.tablas.Usuario;
import com.stockbean.stockapp.repository.EmpresaUsuarioRepository;
import com.stockbean.stockapp.repository.PersonaEmpresaRepository;
import com.stockbean.stockapp.repository.UsuarioRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class PersonaService {
    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmpresaUsuarioRepository empresaUsuarioRepository;

    @Autowired
    private PersonaEmpresaRepository personaEmpresaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Integer ID_ROL_SISTEMAS = 1;

    public List<Persona> listarTodas() {
        return personaRepository.findAll();
    }

    public List<Persona> listarPersonasPorSolicitante(@NonNull Integer idUsuarioSolicitante) {
        Usuario solicitante = usuarioRepository.findById(idUsuarioSolicitante)
                .orElseThrow(() -> new RuntimeException("Usuario solicitante no encontrado"));

        // Si es ROOT / SISTEMAS, ve todas las personas
        if (ID_ROL_SISTEMAS.equals(solicitante.getId_rol())) {
            return personaRepository.findAll();
        }

        // Si no es ROOT, obtenemos su empresa
        List<Integer> idsEmpresa = empresaUsuarioRepository.findIdEmpresaByUsuarioId(idUsuarioSolicitante);

        if (idsEmpresa.isEmpty()) {
            return List.of();
        }

        Integer idEmpresa = idsEmpresa.get(0); // Take the first one

        return personaRepository.findByEmpresaId(idEmpresa);
    }

    public Persona obtenerPorId(@NonNull Integer id) {
        return personaRepository.findById(id).orElse(null);
    }

    @Transactional
    public Persona guardar(Persona persona, @NonNull Integer idUsuario) {
        Usuario solicitante = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario solicitante no encontrado"));

        persona.setFecha_alta(LocalDateTime.now());
        persona.setFecha_ultima_modificacion(LocalDateTime.now());
        persona.setStatus(true);
        Persona savedPersona = personaRepository.save(persona);

        if (!ID_ROL_SISTEMAS.equals(solicitante.getId_rol())) {
            List<Integer> idsEmpresa = empresaUsuarioRepository.findIdEmpresaByUsuarioId(idUsuario);
            if (!idsEmpresa.isEmpty()) {
                PersonaEmpresa pe = new PersonaEmpresa();
                pe.setPersona(savedPersona);

                com.stockbean.stockapp.model.admin.Empresa emp = new com.stockbean.stockapp.model.admin.Empresa();
                emp.setIdEmpresa(idsEmpresa.get(0));

                pe.setEmpresa(emp);
                pe.setFechaIngreso(LocalDate.now());
                pe.setActivo(true);
                personaEmpresaRepository.save(pe);
            } else {
                throw new RuntimeException("El usuario no tiene una empresa asignada para vincular la persona.");
            }
        }
        return savedPersona;
    }

    @Transactional
    public Persona actualizar(@NonNull Integer id, Persona personaActualizada, @NonNull Integer idUsuario) {
        Persona persona = obtenerPorId(id);
        if (persona == null)
            return null;

        // Validar propiedad de la persona antes de actualizar
        validarAccesoPersona(persona, idUsuario);

        persona.setNombre(personaActualizada.getNombre());
        persona.setApellido_paterno(personaActualizada.getApellido_paterno());
        persona.setApellido_materno(personaActualizada.getApellido_materno());
        persona.setEmail(personaActualizada.getEmail());
        persona.setStatus(personaActualizada.getStatus());
        persona.setFecha_ultima_modificacion(LocalDateTime.now());

        if (personaActualizada.getPassword() != null && !personaActualizada.getPassword().isEmpty()) {
            java.util.Optional<Usuario> usuarioOpt = usuarioRepository.findByPersonaId(persona.getId_persona());
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                usuario.setPassword(passwordEncoder.encode(personaActualizada.getPassword()));
                usuarioRepository.save(usuario);
            }
        }

        Persona guardada = personaRepository.save(persona);
        guardada.setPassword(null);
        return guardada;
    }

    @Transactional
    public void eliminar(@NonNull Integer id, @NonNull Integer idUsuario) {
        Persona persona = obtenerPorId(id);
        if (persona != null) {
            Usuario solicitante = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario solicitante no encontrado"));

            validarAccesoPersona(persona, idUsuario);

            if (ID_ROL_SISTEMAS.equals(solicitante.getId_rol())) {
                // Borrado a nivel raiz
                persona.setStatus(false);
                persona.setFecha_baja(LocalDateTime.now());
                persona.setFecha_ultima_modificacion(LocalDateTime.now());
                personaRepository.save(persona);
            } else {
                List<Integer> idsEmpresa = empresaUsuarioRepository.findIdEmpresaByUsuarioId(idUsuario);
                if (!idsEmpresa.isEmpty()) {
                    List<PersonaEmpresa> asignaciones = personaEmpresaRepository.findByEmpresa_IdEmpresaIn(idsEmpresa);
                    for (PersonaEmpresa pe : asignaciones) {
                        if (pe.getPersona().getId_persona().equals(id)) {
                            pe.setActivo(false);
                            pe.setFechaSalida(LocalDate.now());
                            personaEmpresaRepository.save(pe);
                            // NO modificamos la persona general
                            break;
                        }
                    }
                }
            }
        }
    }

    private void validarAccesoPersona(Persona persona, @NonNull Integer idUsuario) {
        Usuario solicitante = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario solicitante no encontrado"));

        if (ID_ROL_SISTEMAS.equals(solicitante.getId_rol())) {
            return;
        }

        List<Integer> idsEmpresa = empresaUsuarioRepository.findIdEmpresaByUsuarioId(idUsuario);
        if (idsEmpresa.isEmpty()) {
            throw new RuntimeException("El usuario no tiene empresa asignada.");
        }

        List<Persona> personasDeLaEmpresa = personaRepository.findByEmpresaId(idsEmpresa.get(0));
        boolean pertenece = personasDeLaEmpresa.stream()
                .anyMatch(p -> p.getId_persona().equals(persona.getId_persona()));

        if (!pertenece) {
            throw new RuntimeException("Acceso denegado: La persona no pertenece a la empresa.");
        }
    }
}
