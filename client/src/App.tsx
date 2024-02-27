import { AuthProvider } from './contexts/auth';
import { ThemeProvider } from './contexts/theme';
import { Routes } from './routes';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
