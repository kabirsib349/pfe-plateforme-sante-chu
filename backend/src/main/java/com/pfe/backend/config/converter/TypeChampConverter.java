package com.pfe.backend.config.converter;

import com.pfe.backend.model.TypeChamp;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

@Converter(autoApply = true)
public class TypeChampConverter implements AttributeConverter<TypeChamp, String> {

    @Override
    public String convertToDatabaseColumn(TypeChamp type) {
        if (type == null) { return null; }
        return type.getValue();
    }

    @Override
    public TypeChamp convertToEntityAttribute(String value) {
        if (value == null) { return null; }
        return Stream.of(TypeChamp.values())
                .filter(t -> t.getValue().equals(value))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}