import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated }) {
  const [password1, setPassword1] = useState(''); // Erstes Passwortfeld für "Kraft"
  const [password2, setPassword2] = useState(''); // Zweites Passwortfeld für "Vision"
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Static passwords
  const validPassword1 = 'Kraft';
  const validPassword2 = 'Vision';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Play epic sound effect
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create deep bass rumble effect
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Deep bass frequency
      oscillator.frequency.setValueAtTime(45, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(25, audioContext.currentTime + 0.8);

      // Low-pass filter for that rumbling effect
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, audioContext.currentTime);

      // Volume envelope for ice/rock cracking effect
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password1 === validPassword1 && password2 === validPassword2) {
      // Successful login - direktes Weiterleiten ohne Alert

      // Authentifizierung speichern
      localStorage.setItem('authToken', 'team-authenticated');

      // Auth-Status aktualisieren
      setIsAuthenticated(true);

      // Mit React Router navigieren
      navigate('/admin');

      setIsLoading(false);
      setPassword1('');
      setPassword2('');
    } else {
      // Wrong password
      setError('Invalid password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 85% 85%, rgba(237, 137, 54, 0.15) 0%, rgba(26, 32, 44, 0.95) 30%, #0d1117 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background with animated gradients - Darker with bottom-right light */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 85% 85%, rgba(237, 137, 54, 0.25) 0%, rgba(0, 0, 0, 0) 40%)',
          opacity: 0.6,
          animation: 'pulse 8s infinite alternate'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 90% 90%, rgba(237, 137, 54, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
          opacity: 0.4,
          animation: 'pulse 12s infinite alternate-reverse'
        }} />
      </div>

      {/* Floating formulas */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          fontFamily: 'monospace',
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 0 10px rgba(237, 137, 54, 0.7)',
          transform: 'rotate(-12deg)',
          animation: 'float 18s infinite ease-in-out'
        }}>
          1RM = Load / (a·MCV + b)
        </div>
        <div style={{
          position: 'absolute',
          top: '25%',
          right: '15%',
          fontFamily: 'monospace',
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 0 10px rgba(237, 137, 54, 0.7)',
          transform: 'rotate(8deg)',
          animation: 'float 22s infinite ease-in-out reverse'
        }}>
          F(V) = F₀ - (F₀/V₀)·V
        </div>
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 0 10px rgba(237, 137, 54, 0.7)',
          transform: 'rotate(-5deg)',
          animation: 'float 20s infinite ease-in-out'
        }}>
          Load = m₁·Velocity + m₂
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '10%',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 0 10px rgba(237, 137, 54, 0.7)',
          transform: 'rotate(6deg)',
          animation: 'float 19s infinite ease-in-out reverse'
        }}>
          MPV = Displacement / Time
        </div>
      </div>

      {/* Fire particles */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        opacity: 0.3,
        zIndex: 20
      }}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: `hsl(${25 + i * 5}, 100%, 70%)`,
              width: `${4 + (i % 5)}px`,
              height: `${4 + (i % 5)}px`,
              left: `${(i * 6 + 10) % 90}%`,
              bottom: '0',
              opacity: 0.8,
              animation: `rise ${8 + (i % 4)}s infinite linear`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Pulsing rings behind the logo - Much Bigger */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5
      }}>
        {[0, 1.3, 2.6].map((delay, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              border: '3px solid rgba(237, 137, 54, 0.6)',
              borderRadius: '50%',
              opacity: 0,
              animation: 'pulseRing 4s infinite ease-out',
              animationDelay: `${delay}s`
            }}
          />
        ))}
      </div>

      {/* Main login card */}
      <div style={{
        background: 'rgba(26, 32, 44, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '60px 50px',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
        border: '1px solid rgba(237, 137, 54, 0.3)',
        position: 'relative',
        zIndex: 30,
        animation: 'slideUp 0.8s ease-out'
      }}>

        {/* Big Lightning Logo with pulsing animation */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 30px',
          background: 'linear-gradient(135deg, #ed8936, #f6ad55)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '64px',
          fontWeight: '800',
          color: 'white',
          boxShadow: '0 15px 40px rgba(237, 137, 54, 0.5)',
          animation: 'logoPulse 2s ease-in-out infinite',
          position: 'relative'
        }}>
          ⚡
        </div>

        {/* Title with glow effect */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          background: 'linear-gradient(90deg, #ed8936, #f6ad55)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px',
          letterSpacing: '2px',
          textShadow: '0 0 30px rgba(237, 137, 54, 0.4)',
          animation: 'titleGlow 3s infinite alternate'
        }}>
          PROMETHEUS
        </h1>

        <p style={{
          color: '#a0aec0',
          fontSize: '16px',
          marginBottom: '40px',
          fontWeight: '500'
        }}>
          Exercise Library
        </p>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(245, 101, 101, 0.1)',
            border: '1px solid rgba(245, 101, 101, 0.3)',
            color: '#fed7d7',
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '25px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form mit Eingabefeldern */}
        <form onSubmit={handleSubmit}>
          {/* First Password input */}
          <div style={{ marginBottom: '25px' }}>
            <input
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              placeholder="Password 1"
              style={{
                width: '100%',
                padding: '18px 22px',
                border: '2px solid rgba(160, 174, 192, 0.2)',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'rgba(74, 85, 104, 0.3)',
                color: 'white',
                transition: 'all 0.3s ease',
                outline: 'none',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ed8936';
                e.target.style.background = 'rgba(74, 85, 104, 0.5)';
                e.target.style.boxShadow = '0 0 25px rgba(237, 137, 54, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(160, 174, 192, 0.2)';
                e.target.style.background = 'rgba(74, 85, 104, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          {/* Second Password input */}
          <div style={{ marginBottom: '25px' }}>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Password 2"
              style={{
                width: '100%',
                padding: '18px 22px',
                border: '2px solid rgba(160, 174, 192, 0.2)',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'rgba(74, 85, 104, 0.3)',
                color: 'white',
                transition: 'all 0.3s ease',
                outline: 'none',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ed8936';
                e.target.style.background = 'rgba(74, 85, 104, 0.5)';
                e.target.style.boxShadow = '0 0 25px rgba(237, 137, 54, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(160, 174, 192, 0.2)';
                e.target.style.background = 'rgba(74, 85, 104, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '18px',
              background: isLoading
                ? 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)'
                : 'linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(237, 137, 54, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 40px rgba(237, 137, 54, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(237, 137, 54, 0.4)';
              }
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '12px'
                }} />
                Accessing Prometheus...
              </div>
            ) : (
              'Access Exercise Library'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '35px',
          color: '#718096',
          fontSize: '14px',
          fontWeight: '500',
          fontStyle: 'italic'
        }}>
          *Powered by cutting-edge sports science*
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(var(--rotation, 0deg)); }
          25% { transform: translate(15px, -15px) rotate(var(--rotation, 0deg)); }
          50% { transform: translate(5px, 20px) rotate(var(--rotation, 0deg)); }
          75% { transform: translate(-15px, -10px) rotate(var(--rotation, 0deg)); }
        }

        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-1000px) scale(0); opacity: 0; }
        }

        @keyframes pulseRing {
          0% { transform: scale(0.2); opacity: 0.8; }
          100% { transform: scale(4.5); opacity: 0; }
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 15px 40px rgba(237, 137, 54, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 20px 50px rgba(237, 137, 54, 0.7); }
        }

        @keyframes titleGlow {
          0% { text-shadow: 0 0 10px rgba(237, 137, 54, 0.4); }
          100% { text-shadow: 0 0 30px rgba(237, 137, 54, 0.7), 0 0 60px rgba(237, 137, 54, 0.3); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        input::placeholder {
          color: #a0aec0;
          font-weight: 400;
        }

        @media (max-width: 480px) {
          div[style*="padding: 60px 50px"] {
            padding: 40px 30px !important;
            margin: 20px !important;
          }
          
          h1[style*="fontSize: '36px'"] {
            font-size: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
