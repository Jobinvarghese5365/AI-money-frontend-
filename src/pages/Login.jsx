import { useForm } from "react-hook-form";
import { useAuth } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    console.log('Login form submitted:', { ...values, password: '***' });
    const ok = await login(values.email, values.password);
    
    console.log('Login result:', ok);
    if (ok) {
      console.log('Navigating to dashboard...');
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-emerald-50 to-teal-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 bg-emerald-500 p-6 rounded-xl shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-emerald-950">Sign in</h1>

        <div>
          <input
            className="w-full border p-3 rounded bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            placeholder="Email"
            type="email"
            {...formRegister("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && (
            <p className="text-red-700 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            className="w-full border p-3 rounded bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            placeholder="Password"
            type="password"
            {...formRegister("password", { 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
          />
          {errors.password && (
            <p className="text-red-700 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="text-red-700 text-sm bg-red-100/70 px-3 py-2 rounded">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded font-medium disabled:opacity-70 transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-center pt-2">
          <Link
            to="/signup"
            onClick={clearError}
            className="text-emerald-950 hover:text-emerald-900 text-sm font-medium underline"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}