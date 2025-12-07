import { useState } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FieldValues, UseFormRegister } from 'react-hook-form';

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues>;
  error?: string;
  helperText?: string;
} & Omit<TextFieldProps, 'name' | 'error'>;

function PasswordInput({ name, register, error, helperText, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const registration = register ? register(name) : {};

  return (
    <TextField
      type={show ? 'text' : 'password'}
      fullWidth
      margin="normal"
      {...registration}
      {...rest}
      error={Boolean(error)}
      helperText={error || helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton aria-label="toggle password visibility" onClick={() => setShow((prev) => !prev)} edge="end">
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export default PasswordInput;
