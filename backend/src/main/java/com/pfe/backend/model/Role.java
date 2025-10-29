package com.pfe.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="role")
@Getter
@Setter
public class Role {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name="id_role")
        private Integer id;

        @Column(name="nom", nullable=false, unique=true, length=50)
        private String nom;
}
