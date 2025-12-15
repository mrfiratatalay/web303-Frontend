import apiClient from './apiClient';
import { Classroom } from '../types/academics';

export const getClassrooms = () => apiClient.get<Classroom[]>('/classrooms');
