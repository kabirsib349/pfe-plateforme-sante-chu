package com.pfe.backend.model.converter;

import com.pfe.backend.model.StatutEtude;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

@Converter(autoApply = true)
public class StatutEtudeConverter implements AttributeConverter<StatutEtude, String> {

    @Override
    public String convertToDatabaseColumn(StatutEtude statut) {
        if (statut == null) { return null; }
        return statut.getValue();
    }

    @Override
    public StatutEtude convertToEntityAttribute(String value) {
        if (value == null) { return null; }
        return Stream.of(StatutEtude.values())
                .filter(s -> s.getValue().equals(value))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}