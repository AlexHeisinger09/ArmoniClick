export interface Document {
  id: number;
  patient_id: number;
  type: DocumentType;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  signature_data?: string;
  created_at: string;
  signed_at?: string;
  doctor_id: number;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  template: string;
}

export interface DocumentSignature {
  document_id: number;
  signature_data: string;
  signed_at: string;
  ip_address?: string;
}