package com.uoa.planent.annotation;

import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.deser.std.StdDeserializer;

public class TrimDeserializer extends StdDeserializer<String> {

    public TrimDeserializer() {
        super(String.class);
    }

    @Override
    public String deserialize(JsonParser p, DeserializationContext context) {
        String value = p.getValueAsString();
        return value != null ? value.strip() : null;
    }
}
