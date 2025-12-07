import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldValues, UseFormRegister } from 'react-hook-form';

type Props = {
  name: string;
  label: string;
  register?: UseFormRegister<FieldValues>;
  error?: string;
} & Omit<CheckboxProps, 'name' | 'error'>;

function CheckboxInput({ label, name, register, error, ...rest }: Props) {
  const registration = register ? register(name) : {};

  return (
    <FormControl error={Boolean(error)}>
      <FormControlLabel control={<Checkbox {...registration} {...rest} />} label={label} />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default CheckboxInput;
