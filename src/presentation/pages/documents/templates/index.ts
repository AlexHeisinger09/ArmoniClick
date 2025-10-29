export const documentTemplates = {
  'consentimiento-estetica': {
    title: 'CONSENTIMIENTO INFORMADO - TRATAMIENTO ESTÉTICO FACIAL',
    content: `CONSENTIMIENTO INFORMADO - PROCEDIMIENTO ESTÉTICO FACIAL

Paciente: {{PATIENT_NAME}} | RUT: {{PATIENT_RUT}}
Profesional: {{DOCTOR_NAME}} | RUT: {{DOCTOR_RUT}}
Fecha: {{SIGNED_DATE}}

---

Yo, {{PATIENT_NAME}}, declaro que he sido informado(a) clara y completamente sobre el procedimiento estético facial que será realizado por el Dr./Dra. {{DOCTOR_NAME}}.

INFORMACIÓN DEL PROCEDIMIENTO:
He comprendido la naturaleza, objetivos, beneficios esperados, tiempo de recuperación y posibles riesgos del procedimiento, incluyendo hinchazón, enrojecimiento, cambios temporales en la sensibilidad y, en casos excepcionales, reacciones alérgicas.

ANTECEDENTES MÉDICOS:
Declaro haber informado verazmente sobre mis antecedentes médicos, alergias, medicamentos en uso y procedimientos previos.

RESPONSABILIDADES POSTOPERATORIAS:
Me comprometo a seguir las instrucciones de cuidado postoperatorio, asistir a controles de seguimiento y reportar cualquier complicación inmediatamente.

CONSENTIMIENTO:
Otorgo mi consentimiento voluntario e informado para realizar el procedimiento propuesto. Autorizo el uso de registros clínicos con fines de documentación médica.

Para consultas:
{{DOCTOR_NAME}} | Tel: {{DOCTOR_PHONE}} | Email: {{DOCTOR_EMAIL}}

---

`
  },

  'consentimiento-odontologico': {
    title: 'CONSENTIMIENTO INFORMADO - TRATAMIENTO ODONTOLÓGICO',
    content: `CONSENTIMIENTO INFORMADO - TRATAMIENTO ODONTOLÓGICO

Paciente: {{PATIENT_NAME}} | RUT: {{PATIENT_RUT}}
Profesional: {{DOCTOR_NAME}} | RUT: {{DOCTOR_RUT}}
Fecha: {{SIGNED_DATE}}

---

Yo, {{PATIENT_NAME}}, declaro que he sido informado(a) clara y completamente sobre el tratamiento odontológico que será realizado por el Dr./Dra. {{DOCTOR_NAME}}.

DIAGNÓSTICO Y PLAN DE TRATAMIENTO:
He comprendido mi diagnóstico dental, el plan de tratamiento propuesto, el número de sesiones requeridas, duración estimada y beneficios esperados, incluyendo la resolución de la condición y mejora de la función masticatoria y estética dental.

RIESGOS Y COMPLICACIONES:
He sido informado(a) sobre posibles riesgos incluyendo dolor postoperatorio, inflamación, sangrado, daño a estructuras adyacentes, infección y reacciones alérgicas a materiales utilizados.

ANTECEDENTES MÉDICOS Y DENTALES:
Declaro haber informado verazmente sobre mis antecedentes de salud, alergias a medicamentos, condiciones de coagulación y procedimientos dentales previos.

RESPONSABILIDADES POSTOPERATORIAS:
Me comprometo a tomar medicamentos según indicaciones, mantener higiene oral óptima, evitar alimentos duros, asistir a controles y reportar inmediatamente cualquier complicación.

CONSENTIMIENTO:
Otorgo mi consentimiento voluntario e informado para el tratamiento propuesto. Autorizo el uso de registros clínicos con fines de documentación.

Para consultas:
{{DOCTOR_NAME}} | Tel: {{DOCTOR_PHONE}} | Email: {{DOCTOR_EMAIL}}

---

`
  },

  'consentimiento-anestesia': {
    title: 'CONSENTIMIENTO INFORMADO - PROCEDIMIENTO BAJO ANESTESIA',
    content: `CONSENTIMIENTO INFORMADO - PROCEDIMIENTO BAJO ANESTESIA

Paciente: {{PATIENT_NAME}} | RUT: {{PATIENT_RUT}}
Profesional: {{DOCTOR_NAME}} | RUT: {{DOCTOR_RUT}}
Fecha: {{SIGNED_DATE}}

---

Yo, {{PATIENT_NAME}}, declaro que he sido informado(a) claramente sobre el procedimiento que requiere anestesia, que será realizado por el Dr./Dra. {{DOCTOR_NAME}}.

INFORMACIÓN SOBRE LA ANESTESIA:
Comprendo el tipo de anestesia a utilizar, su mecanismo de acción, duración esperada y cómo afectará mi estado de consciencia durante el procedimiento. Entiendo que la anestesia tiene como objetivo eliminar el dolor, permitir el procedimiento seguro y reducir la ansiedad.

RIESGOS DE LA ANESTESIA:
He sido informado(a) sobre posibles riesgos incluyendo reacciones alérgicas, náuseas y vómitos, mareos temporales, cambios en presión arterial o frecuencia cardíaca, y en casos raros, complicaciones cardiovasculares.

MONITOREO Y SEGURIDAD:
Seré monitoreado(a) continuamente durante el procedimiento. Personal médico especializado estará presente en todo momento con protocolos de seguridad y equipos de emergencia disponibles.

ANTECEDENTES MÉDICOS CRÍTICOS:
Declaro haber informado verazmente sobre reacciones adversas previas a anestésicos, alergias a medicamentos, condiciones cardíacas, problemas respiratorios, problemas de coagulación, diabetes, y cualquier otra condición relevante.

ESTADO DE AYUNO:
Declaro haber comprendido y comprometiéndome a cumplir las instrucciones de ayuno preoperatorio esencial para prevenir aspiración.

CONSENTIMIENTO PARA ANESTESIA:
Otorgo mi consentimiento informado, libre y voluntario para recibir la anestesia indicada, administrada por profesionales calificados. Comprendo completamente los riesgos, beneficios y alternativas.

Para consultas:
{{DOCTOR_NAME}} | Tel: {{DOCTOR_PHONE}} | Email: {{DOCTOR_EMAIL}}

---

`
  },

  'permiso-padres': {
    title: 'AUTORIZACIÓN DE PADRE/TUTOR - PROCEDIMIENTO MÉDICO',
    content: `AUTORIZACIÓN DE PADRE O TUTOR

DATOS DEL PACIENTE (Menor de edad):
Nombre Completo: {{PATIENT_NAME}}
RUT: {{PATIENT_RUT}}
Edad: {{PATIENT_AGE}} años

DATOS DEL PADRE/MADRE/TUTOR:
Nombre Completo: {{PARENT_NAME}}
RUT: {{PARENT_RUT}}
Teléfono: {{PARENT_PHONE}}
Relación: {{PARENT_RELATION}}

PROFESIONAL RESPONSABLE:
Nombre: {{DOCTOR_NAME}} | RUT: {{DOCTOR_RUT}}
Teléfono: {{DOCTOR_PHONE}} | Email: {{DOCTOR_EMAIL}}
Fecha: {{SIGNED_DATE}}

---

Yo, {{PARENT_NAME}}, como {{PARENT_RELATION}} legal del menor {{PATIENT_NAME}}, he sido informado(a) clara y completamente sobre el procedimiento médico propuesto.

INFORMACIÓN DEL PROCEDIMIENTO:
Comprendo la naturaleza del procedimiento, sus objetivos, beneficios esperados, tiempo de recuperación y posibles riesgos y complicaciones. He tenido la oportunidad de realizar preguntas al Dr./Dra. {{DOCTOR_NAME}} y todas han sido respondidas satisfactoriamente.

RESPONSABILIDADES:
Me comprometo a apoyar al menor en el cumplimiento de cuidados postoperatorios, asistencia a controles de seguimiento y reportar inmediatamente cualquier complicación.

ANTECEDENTES MÉDICOS:
He informado verazmente sobre antecedentes médicos familiares relevantes, alergias y condiciones que puedan afectar la recuperación.

CONSENTIMIENTO Y AUTORIZACIÓN:
Otorgo mi consentimiento informado y voluntario para que el procedimiento sea realizado en el menor {{PATIENT_NAME}}. Autorizo el uso de registros clínicos con fines de documentación médica.

Para consultas:
{{DOCTOR_NAME}} | Tel: {{DOCTOR_PHONE}} | Email: {{DOCTOR_EMAIL}}

---

Firma del Padre/Madre/Tutor: ______________________________
RUT: {{PARENT_RUT}}`
  },

  'permiso-padres-estetica': {
    title: 'AUTORIZACIÓN DE PADRE/TUTOR - PROCEDIMIENTO ESTÉTICO',
    content: `AUTORIZACIÓN DE PADRE O TUTOR - PROCEDIMIENTO ESTÉTICO

DATOS DEL PACIENTE (Menor de edad):
Nombre Completo: {{PATIENT_NAME}}
RUT: {{PATIENT_RUT}}
Edad: {{PATIENT_AGE}} años

DATOS DEL PADRE/MADRE/TUTOR:
Nombre Completo: {{PARENT_NAME}}
RUT: {{PARENT_RUT}}
Teléfono: {{PARENT_PHONE}}
Relación: {{PARENT_RELATION}}

PROFESIONAL RESPONSABLE:
Nombre: {{DOCTOR_NAME}} | RUT: {{DOCTOR_RUT}}
Teléfono: {{DOCTOR_PHONE}} | Email: {{DOCTOR_EMAIL}}
Fecha: {{SIGNED_DATE}}

---

Yo, {{PARENT_NAME}}, como {{PARENT_RELATION}} legal del menor {{PATIENT_NAME}}, he sido informado(a) clara y completamente sobre el procedimiento estético propuesto.

INFORMACIÓN DEL PROCEDIMIENTO:
Comprendo que el procedimiento es de carácter estético con objetivo de mejorar la apariencia facial o corporal. He comprendido los objetivos, beneficios esperados, resultados aproximados, tiempo de recuperación y posibles riesgos incluyendo cambios en sensibilidad, variabilidad en resultados y complicaciones excepcionales.

RESPONSABILIDADES:
Me comprometo a apoyar al menor en cuidados postoperatorios, aplicación de tratamientos tópicos, protección solar, asistencia a controles de seguimiento y reporte inmediato de complicaciones.

ANTECEDENTES MÉDICOS:
He informado verazmente sobre antecedentes familiares de trastornos de cicatrización, alergias a medicamentos, condiciones sistémicas y cualquier información médica relevante.

CONSENTIMIENTO PARENTAL:
Otorgo mi consentimiento informado y voluntario para que el Dr./Dra. {{DOCTOR_NAME}} realice el procedimiento estético en el menor {{PATIENT_NAME}}. Autorizo el uso de fotografías, videos y registros clínicos con fines de documentación médica.

Para consultas:
{{DOCTOR_NAME}} | Tel: {{DOCTOR_PHONE}} | Email: {{DOCTOR_EMAIL}}

---

Firma del Padre/Madre/Tutor: ______________________________
RUT: {{PARENT_RUT}}`
  }
};
