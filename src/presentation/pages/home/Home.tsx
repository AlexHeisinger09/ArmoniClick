import PatientGrid from "../../components/PatientGrid";
import { useAuth } from "../../context/AuthContext";

export function Home() {
  const { user } = useAuth();
  
  return <PatientGrid doctorId={user?.id} />;
}

