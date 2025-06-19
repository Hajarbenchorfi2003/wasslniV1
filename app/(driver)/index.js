import { getUser } from '../../utils/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function driverPage() {
   
  const [loading, setLoading] = useState(true); // To handle the loading state
  const router = useRouter();
  
    useEffect(() => {
      const user = getUser();
      if (!user || user.role !== 'DRIVER') {
        router.push('/login');
      } else {
        setLoading(false); // If the user is found and has the correct role, stop loading
      }
    }, [router]);
  
    if (loading) {
      return <div>Loading...</div>; // Show loading message while verifying user
    }

  return <h1>Bienvenue driver</h1>;
}
