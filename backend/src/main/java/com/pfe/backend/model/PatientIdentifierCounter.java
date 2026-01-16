package com.pfe.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patient_identifier_counters", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"formulaire_id"})
})
public class PatientIdentifierCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "formulaire_id", nullable = false)
    private Long formulaireId;

    @Column(name = "counter", nullable = false)
    private Integer counter = 0;

    public PatientIdentifierCounter() {
    }

    public PatientIdentifierCounter(Long formulaireId, Integer counter) {
        this.formulaireId = formulaireId;
        this.counter = counter;
    }

    public Long getId() {
        return id;
    }

    public Long getFormulaireId() {
        return formulaireId;
    }

    public void setFormulaireId(Long formulaireId) {
        this.formulaireId = formulaireId;
    }

    public Integer getCounter() {
        return counter;
    }

    public void setCounter(Integer counter) {
        this.counter = counter;
    }
}
