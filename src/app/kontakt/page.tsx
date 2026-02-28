import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: "Skontaktuj się z L'EMIR. Adres, telefon, godziny otwarcia i formularz kontaktowy.",
}

export default function KontaktPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Kontakt</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — dane kontaktowe */}
        <div className="space-y-6">
          {/* Adres */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Dane kontaktowe</h2>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">L&apos;EMIR Sp. z o.o.</p>
                <p className="text-gray-600">ul. Jana III Sobieskiego 16</p>
                <p className="text-gray-600">41-300 Dąbrowa Górnicza</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary-600 shrink-0" />
              <a href="tel:+48325088000" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                +48 32 508 80 00
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary-600 shrink-0" />
              <a href="mailto:biuro@lemir.com.pl" className="text-gray-700 hover:text-primary-600 transition-colors">
                biuro@lemir.com.pl
              </a>
            </div>
          </div>

          {/* Godziny */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900 text-lg">Godziny otwarcia</h2>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { day: 'Poniedziałek – Piątek', hours: '8:00 – 17:00' },
                { day: 'Sobota', hours: '9:00 – 14:00' },
                { day: 'Niedziela', hours: 'Zamknięte' },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{day}</span>
                  <span className={`font-medium ${hours === 'Zamknięte' ? 'text-gray-400' : 'text-gray-900'}`}>
                    {hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — mapa */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ minHeight: '400px' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2551.5!2d19.1833!3d50.3216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sul.+Jana+III+Sobieskiego+16%2C+D%C4%85browa+G%C3%B3rnicza!5e0!3m2!1spl!2spl!4v1"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '400px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokalizacja L'EMIR"
          />
        </div>
      </div>

      {/* Formularz kontaktowy */}
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 max-w-2xl">
        <h2 className="font-semibold text-gray-900 text-lg mb-5">Napisz do nas</h2>
        <ContactForm />
      </div>
    </div>
  )
}

function ContactForm() {
  return (
    <form
      action="https://formsubmit.co/biuro@lemir.com.pl"
      method="POST"
      className="space-y-4"
    >
      <input type="hidden" name="_subject" value="Wiadomość ze strony L'EMIR" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_next" value="https://oferta.lemir.com.pl/kontakt?sent=1" />
      <input type="text" name="_honey" className="hidden" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Imię i nazwisko *</label>
          <input
            type="text"
            name="name"
            required
            maxLength={100}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Telefon</label>
          <input
            type="tel"
            name="phone"
            maxLength={20}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Email *</label>
        <input
          type="email"
          name="email"
          required
          maxLength={200}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Wiadomość *</label>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={2000}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
      >
        Wyślij wiadomość
      </button>

      <p className="text-xs text-gray-400 text-center">
        Twoje dane są bezpieczne i nie będą udostępniane.
      </p>
    </form>
  )
}
