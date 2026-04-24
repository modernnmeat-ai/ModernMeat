import { useState, useEffect } from 'react';
import { Flame, Phone, User, ArrowRight, CheckCircle, ChevronLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Mode = 'choose' | 'login' | 'reg-name' | 'reg-phone' | 'reg-password' | 'reg-confirm';

export function LoginRegister() {
  const { login, register, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('choose');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate(isAdmin ? '/admin' : '/');
  }, [isLoggedIn, isAdmin, navigate]);

  const resetAll = () => {
    setError(''); setSuccess('');
    setFirstName(''); setLastName('');
    setPhone(''); setPassword(''); setConfirmPass('');
    setShowPass(false); setShowConfirmPass(false);
  };

  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) cleaned = '+' + cleaned.replace(/\+/g, '');
    setPhone(cleaned);
    setError('');
  };

  // ---- LOGIN ----
  const handleLogin = async () => {
    if (!phone) { setError('Telefon raqamni kiriting.'); return; }
    if (!password) { setError('Parolni kiriting.'); return; }
    setLoading(true);
    try {
      const r = await login(phone, password);
      if (r.success) setSuccess(r.message);
      else setError(r.message);
    } catch (err) {
      console.error(err);
      setError('Tizimga kirishda xatolik!');
    } finally {
      setLoading(false);
    }
  };

  // ---- REGISTER steps ----
  const handleRegName = () => {
    if (!firstName.trim() || !lastName.trim()) { setError("Ism va familiyani kiriting."); return; }
    setError(''); setMode('reg-phone');
  };

  const handleRegPhone = () => {
    if (!phone || phone.length < 8) { setError("To'g'ri telefon raqam kiriting."); return; }
    setError(''); setMode('reg-password');
  };

  const handleRegPassword = () => {
    if (!password || password.length < 6) { setError("Parol kamida 6 ta belgi bo'lsin."); return; }
    if (password !== confirmPass) { setError("Parollar mos kelmayapti."); return; }
    setError(''); setMode('reg-confirm');
  };

  const handleRegConfirm = async () => {
    setLoading(true);
    try {
      const r = await register(firstName, lastName, phone, password);
      if (r.success) setSuccess(r.message);
      else { setError(r.message); setMode('reg-phone'); }
    } catch (err) {
      console.error(err);
      setError('Ro\'yxatdan o\'tishda xatolik!');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    const map: Partial<Record<Mode, Mode>> = {
      'login': 'choose', 'reg-name': 'choose',
      'reg-phone': 'reg-name', 'reg-password': 'reg-phone',
      'reg-confirm': 'reg-password'
    };
    if (map[mode]) setMode(map[mode]!);
  };

  // Step indicator for register
  const stepMap: Partial<Record<Mode, number>> = {
    'reg-name': 1, 'reg-phone': 2, 'reg-password': 3, 'reg-confirm': 4
  };
  const currentStep = stepMap[mode] ?? 0;
  const totalSteps = 4;

  return (
    <div className="auth-page">
      <div className="auth-bg-overlay" />

      <div className="auth-container">
        <div className="auth-logo">
          <Flame color="#D4AF37" size={40} />
          <span>MODERN MEAT</span>
        </div>

        <div className="auth-card">
          {mode !== 'choose' && (
            <button className="auth-back-btn" onClick={goBack}>
              <ChevronLeft size={20} /> Orqaga
            </button>
          )}

          {/* CHOOSE */}
          {mode === 'choose' && (
            <div className="auth-choose">
              <h2 className="auth-title">Xush Kelibsiz!</h2>
              <p className="auth-subtitle">Davom etish uchun tanlang</p>
              <div className="auth-choose-btns">
                <button className="auth-choose-btn" onClick={() => { resetAll(); setMode('login'); }}>
                  <Phone size={24} />
                  <div>
                    <strong>Kirish</strong>
                    <span>Mavjud hisob bilan</span>
                  </div>
                  <ArrowRight size={20} className="auth-arrow" />
                </button>
                <button className="auth-choose-btn" onClick={() => { resetAll(); setMode('reg-name'); }}>
                  <User size={24} />
                  <div>
                    <strong>Ro'yxatdan o'tish</strong>
                    <span>Yangi hisob yaratish</span>
                  </div>
                  <ArrowRight size={20} className="auth-arrow" />
                </button>
              </div>
            </div>
          )}

          {/* LOGIN */}
          {mode === 'login' && (
            <div className="auth-form-section">
              <div className="auth-icon-circle"><Phone size={28} /></div>
              <h2 className="auth-title">Tizimga Kirish</h2>
              <p className="auth-subtitle">Telefon raqam va parolingizni kiriting</p>

              <div className="auth-input-group">
                <label>Telefon raqam</label>
                <div className="auth-input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" placeholder="+998 XX XXX XX XX" value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="auth-input" autoFocus />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Parol</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <div className="auth-input-pass" style={{width:'100%'}}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Parolni kiriting"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className="auth-input"
                      style={{paddingLeft:'44px'}}
                    />
                    <button className="show-pass-btn" onClick={() => setShowPass(!showPass)} type="button">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success"><CheckCircle size={16} /> {success}</div>}

              <button className="auth-submit-btn" onClick={handleLogin} disabled={loading}>
                {loading ? <span className="auth-loader" /> : <><ArrowRight size={18} /> Kirish</>}
              </button>
            </div>
          )}

          {/* REG STEP 1: Name */}
          {mode === 'reg-name' && (
            <div className="auth-form-section">
              <div className="auth-steps-bar">
                {Array.from({length: totalSteps}, (_, i) => (
                  <div key={i} className={`auth-step-dot ${i < currentStep ? 'done' : i === currentStep - 1 ? 'active' : ''}`} />
                ))}
              </div>
              <div className="auth-icon-circle"><User size={28} /></div>
              <h2 className="auth-title">Ism va Familiya</h2>
              <p className="auth-subtitle">To'liq ismingizni kiriting</p>

              <div className="auth-input-group">
                <label>Ism</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="input-icon" />
                  <input type="text" placeholder="Masalan: Abdulloh" value={firstName}
                    onChange={e => { setFirstName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleRegName()}
                    className="auth-input" autoFocus />
                </div>
              </div>
              <div className="auth-input-group">
                <label>Familiya</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="input-icon" />
                  <input type="text" placeholder="Masalan: Solihov" value={lastName}
                    onChange={e => { setLastName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleRegName()}
                    className="auth-input" />
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              <button className="auth-submit-btn" onClick={handleRegName}>
                Davom etish <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* REG STEP 2: Phone */}
          {mode === 'reg-phone' && (
            <div className="auth-form-section">
              <div className="auth-steps-bar">
                {Array.from({length: totalSteps}, (_, i) => (
                  <div key={i} className={`auth-step-dot ${i < currentStep ? 'done' : i === currentStep - 1 ? 'active' : ''}`} />
                ))}
              </div>
              <div className="auth-icon-circle"><Phone size={28} /></div>
              <h2 className="auth-title">Telefon Raqam</h2>
              <p className="auth-subtitle">
                <strong style={{color:'var(--gold)'}}>{firstName} {lastName}</strong> — raqamingizni kiriting
              </p>

              <div className="auth-input-group">
                <label>Telefon raqam</label>
                <div className="auth-input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" placeholder="+998 XX XXX XX XX" value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegPhone()}
                    className="auth-input" autoFocus />
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              <button className="auth-submit-btn" onClick={handleRegPhone}>
                Davom etish <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* REG STEP 3: Password */}
          {mode === 'reg-password' && (
            <div className="auth-form-section">
              <div className="auth-steps-bar">
                {Array.from({length: totalSteps}, (_, i) => (
                  <div key={i} className={`auth-step-dot ${i < currentStep ? 'done' : i === currentStep - 1 ? 'active' : ''}`} />
                ))}
              </div>
              <div className="auth-icon-circle"><Lock size={28} /></div>
              <h2 className="auth-title">Parol O'rnatish</h2>
              <p className="auth-subtitle">Kamida 6 ta belgidan iborat parol kiriting</p>

              <div className="auth-input-group">
                <label>Parol</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <div className="auth-input-pass" style={{width:'100%'}}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Yangi parol"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleRegPassword()}
                      className="auth-input"
                      style={{paddingLeft:'44px'}}
                      autoFocus
                    />
                    <button className="show-pass-btn" onClick={() => setShowPass(!showPass)} type="button">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="auth-input-group">
                <label>Parolni tasdiqlang</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <div className="auth-input-pass" style={{width:'100%'}}>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Parolni qayta kiriting"
                      value={confirmPass}
                      onChange={e => { setConfirmPass(e.target.value); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleRegPassword()}
                      className="auth-input"
                      style={{paddingLeft:'44px'}}
                    />
                    <button className="show-pass-btn" onClick={() => setShowConfirmPass(!showConfirmPass)} type="button">
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* password strength */}
              {password.length > 0 && (
                <div className="pass-strength-bar">
                  <div className={`pass-strength-fill strength-${
                    password.length >= 10 ? 'strong' : password.length >= 6 ? 'medium' : 'weak'
                  }`} style={{width: `${Math.min(100, (password.length / 10) * 100)}%`}} />
                  <span className="pass-strength-label">
                    {password.length < 6 ? 'Zaif' : password.length < 10 ? "O'rtacha" : 'Kuchli'}
                  </span>
                </div>
              )}

              {error && <div className="auth-error">{error}</div>}
              <button className="auth-submit-btn" onClick={handleRegPassword}>
                Davom etish <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* REG STEP 4: Confirm */}
          {mode === 'reg-confirm' && (
            <div className="auth-form-section">
              <div className="auth-steps-bar">
                {Array.from({length: totalSteps}, (_, i) => (
                  <div key={i} className={`auth-step-dot ${i < currentStep ? 'done' : i === currentStep - 1 ? 'active' : ''}`} />
                ))}
              </div>
              <div className="auth-icon-circle confirm"><CheckCircle size={28} /></div>
              <h2 className="auth-title">Tasdiqlash</h2>
              <p className="auth-subtitle">Ma'lumotlaringiz to'g'rimi?</p>

              <div className="auth-confirm-card">
                <div className="confirm-row">
                  <span className="confirm-label">Ism Familiya</span>
                  <span className="confirm-value">{firstName} {lastName}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Telefon</span>
                  <span className="confirm-value">{phone}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Parol</span>
                  <span className="confirm-value">{'•'.repeat(Math.min(password.length, 8))}</span>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success"><CheckCircle size={16} /> {success}</div>}

              <button className="auth-submit-btn" onClick={handleRegConfirm} disabled={loading}>
                {loading ? <span className="auth-loader" /> : <><CheckCircle size={18} /> Ro'yxatdan O'tish</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
