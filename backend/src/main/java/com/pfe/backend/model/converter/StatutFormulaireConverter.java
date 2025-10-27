package com.pfe.backend.model.converter;

import com.pfe.backend.model.StatutFormulaire;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

@Converter(autoApply = true)
public class StatutFormulaireConverter implements AttributeConverter<StatutFormulaire, String> {

    @Override
    public String convertToDatabaseColumn(StatutFormulaire statut) {
        if (statut == null) {
            return null;
        }
        return statut.getValue();
    }

    @Override
    public StatutFormulaire convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }
        return Stream.of(StatutFormulaire.values())
                .filter(s -> s.getValue().equals(value))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}