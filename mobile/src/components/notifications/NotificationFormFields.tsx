import { StyleSheet, TextInput, View } from "react-native";

type NotificationFormFieldsProps = {
  title: string;
  description: string;
  destinationRoute: string;
  icon: string;
  payload: string;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeDestinationRoute: (value: string) => void;
  onChangeIcon: (value: string) => void;
  onChangePayload: (value: string) => void;
};

export function NotificationFormFields({
  title,
  description,
  destinationRoute,
  icon,
  payload,
  onChangeTitle,
  onChangeDescription,
  onChangeDestinationRoute,
  onChangeIcon,
  onChangePayload,
}: NotificationFormFieldsProps) {
  return (
    <View style={styles.form}>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Título"
        style={styles.input}
      />

      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        placeholder="Descrição"
        style={[styles.input, styles.multilineInput]}
        multiline
      />

      <TextInput
        value={destinationRoute}
        onChangeText={onChangeDestinationRoute}
        placeholder="Rota de destino"
        style={styles.input}
      />

      <TextInput
        value={icon}
        onChangeText={onChangeIcon}
        placeholder="Ícone (opcional)"
        style={styles.input}
      />

      <TextInput
        value={payload}
        onChangeText={onChangePayload}
        placeholder="Payload (opcional)"
        style={[styles.input, styles.multilineInput]}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
