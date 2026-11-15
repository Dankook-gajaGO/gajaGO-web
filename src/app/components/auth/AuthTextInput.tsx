import type { ComponentProps } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { COLORS, radius } from '../../theme';

type TextInputProps = ComponentProps<typeof TextInput>;

interface AuthTextInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
}

export function AuthTextInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  returnKeyType,
  onSubmitEditing,
}: AuthTextInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      style={styles.input}
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={secureTextEntry}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    color: COLORS.ink,
    fontSize: 15,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
});
