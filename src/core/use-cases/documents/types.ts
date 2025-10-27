export interface Document {
  id: number;
  id_patient: number;
  id_doctor: number;
  patient_id?: number;
  document_type: string;
  title: string;
  content: string;
  patient_name: string;
  patient_rut: string;
  status: 'pendiente' | 'firmado';
  signature_data?: string;
  signed_date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
}

export interface DocumentSignature {
  document_id: number;
  signature_data: string;
  signed_at: string;
  ip_address?: string;
}