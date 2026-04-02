import { useEffect, useMemo, useState } from "react";
import {
  ColorValue,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppParameters } from "@/src/hooks/useAppParameters";

type RouteOption = {
  label: string;
  value: string;
  icon: string;
};

type NotificationFormFieldsProps = {
  title: string;
  description: string;
  destinationRoute: string;
  icon: string;
  placeholderTextColor?: ColorValue;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeDestinationRoute: (value: string) => void;
  onChangeIcon: (value: string) => void;
};

export function NotificationFormFields({
  title,
  description,
  destinationRoute,
  icon,
  placeholderTextColor = "#808080",
  onChangeTitle,
  onChangeDescription,
  onChangeDestinationRoute,
  onChangeIcon,
}: NotificationFormFieldsProps) {
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const { parameterMap } = useAppParameters();

  const routeOptions = useMemo(() => {
    const rawRoutes = parameterMap.notification_routes;

    if (!rawRoutes) {
      return [];
    }

    try {
      const parsedRoutes = JSON.parse(rawRoutes);

      if (!Array.isArray(parsedRoutes)) {
        return [];
      }

      const validRoutes = parsedRoutes.filter(
        (route): route is RouteOption =>
          typeof route?.label === "string" &&
          typeof route?.value === "string" &&
          typeof route?.icon === "string",
      );

      return validRoutes;
    } catch {
      return [];
    }
  }, [parameterMap.notification_routes]);

  const selectedRouteOption = useMemo(
    () => routeOptions.find((option) => option.value === destinationRoute),
    [destinationRoute, routeOptions],
  );

  useEffect(() => {
    if (selectedRouteOption && icon !== selectedRouteOption.icon) {
      onChangeIcon(selectedRouteOption.icon);
    }
  }, [icon, onChangeIcon, selectedRouteOption]);

  function handleSelectRoute(option: RouteOption) {
    onChangeDestinationRoute(option.value);
    onChangeIcon(option.icon);
    setIsRouteDropdownOpen(false);
  }

  return (
    <View style={styles.form}>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Título"
        placeholderTextColor={placeholderTextColor}
        style={styles.input}
      />

      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        placeholder="Descrição"
        style={[styles.input, styles.multilineInput]}
        placeholderTextColor={placeholderTextColor}
        multiline
      />

      <View style={styles.fieldGroup}>
        <Pressable
          disabled={routeOptions.length === 0}
          onPress={() => setIsRouteDropdownOpen((current) => !current)}
          style={styles.selectTrigger}
        >
          <Text
            style={[
              styles.selectTriggerText,
              !selectedRouteOption && styles.placeholderText,
            ]}
          >
            {selectedRouteOption?.label ??
              (routeOptions.length > 0
                ? "Selecione uma rota de destino"
                : "Nenhuma rota configurada")}
          </Text>
        </Pressable>

        {isRouteDropdownOpen ? (
          <View style={styles.dropdown}>
            {routeOptions.map((option) => {
              const isSelected = selectedRouteOption?.value === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelectRoute(option)}
                  style={[
                    styles.dropdownOption,
                    isSelected && styles.dropdownOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownOptionLabel,
                      isSelected && styles.dropdownOptionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.dropdownOptionMeta,
                      isSelected && styles.dropdownOptionLabelSelected,
                    ]}
                  >
                    {option.value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: "#102a43",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#ffffff",
    color: "#102a43",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectTrigger: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectTriggerText: {
    color: "#102a43",
    fontSize: 15,
  },
  placeholderText: {
    color: "#808080",
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownOption: {
    borderBottomColor: "#d9e2ec",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownOptionSelected: {
    backgroundColor: "#e6f0ff",
  },
  dropdownOptionLabel: {
    color: "#102a43",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  dropdownOptionLabelSelected: {
    color: "#1f6feb",
  },
  dropdownOptionMeta: {
    color: "#486581",
    fontSize: 13,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
