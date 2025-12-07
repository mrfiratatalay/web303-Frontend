import * as Yup from 'yup';

const passwordSchema = Yup.string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
  .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
  .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
  .required('Şifre zorunludur');

export const loginSchema = Yup.object({
  email: Yup.string().email('Geçerli bir email girin').required('Email zorunludur'),
  password: Yup.string().required('Şifre zorunludur'),
});

export const registerSchema = Yup.object({
  firstName: Yup.string().required('İsim zorunludur'),
  lastName: Yup.string().required('Soyisim zorunludur'),
  email: Yup.string().email('Geçerli bir email girin').required('Email zorunludur'),
  role: Yup.string().oneOf(['student', 'faculty'], 'Rol seçin').required('Rol zorunludur'),
  departmentId: Yup.string().required('Bölüm seçimi zorunludur'),
  studentNumber: Yup.string().when('role', {
    is: 'student',
    then: (schema) => schema.required('Öğrenci numarası zorunludur'),
    otherwise: (schema) => schema.optional(),
  }),
  employeeNumber: Yup.string().when('role', {
    is: 'faculty',
    then: (schema) => schema.required('Personel numarası zorunludur'),
    otherwise: (schema) => schema.optional(),
  }),
  title: Yup.string().when('role', {
    is: 'faculty',
    then: (schema) => schema.required('Ünvan zorunludur'),
    otherwise: (schema) => schema.optional(),
  }),
  password: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrar zorunludur'),
  acceptTerms: Yup.boolean().oneOf([true], 'Kullanım şartlarını onaylayın'),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Geçerli bir email girin').required('Email zorunludur'),
});

export const resetPasswordSchema = Yup.object({
  password: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrar zorunludur'),
});

export const profileSchema = Yup.object({
  firstName: Yup.string().required('İsim zorunludur'),
  lastName: Yup.string().required('Soyisim zorunludur'),
  phone: Yup.string().nullable(),
});

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Mevcut şifre zorunludur'),
  newPassword: passwordSchema,
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor')
    .required('Yeni şifre tekrar zorunludur'),
});
