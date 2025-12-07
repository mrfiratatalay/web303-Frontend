import TextField, { TextFieldProps } from '@mui/material/TextField';
import { FieldValues, UseFormRegister } from 'react-hook-form';

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues>;
  error?: string;
  helperText?: string;
} & Omit<TextFieldProps, 'name' | 'error'>;

function TextInput({ name, register, error, helperText, ...rest }: Props) {
  const registration = register ? register(name) : {};

  return (
    <TextField
      fullWidth
      margin="normal"
      {...registration}
      {...rest}
      error={Boolean(error)}
      helperText={error || helperText}
    />
  );
}

export default TextInput;
