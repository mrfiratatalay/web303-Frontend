import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectProps } from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import { FieldValues, UseFormRegister } from 'react-hook-form';

type Option = { value: string; label: string };

type Props = {
  name: string;
  label?: string;
  options?: Option[];
  register?: UseFormRegister<FieldValues>;
  error?: string;
} & Omit<SelectProps, 'name' | 'error'>;

function SelectInput({ label, name, options = [], register, error, ...rest }: Props) {
  const registration = register ? register(name) : {};

  return (
    <FormControl fullWidth margin="normal" error={Boolean(error)}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select label={label} defaultValue="" {...registration} {...rest}>
        <MenuItem value="">
          <em>Seciniz</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default SelectInput;
