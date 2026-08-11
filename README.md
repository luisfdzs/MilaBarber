# Mila Barber

Web de la barbería **Mila Barber**, en la calle Río Irati 13 (barrio de la Milagrosa,
Pamplona). Sustituye a la aplicación anterior de milabarberr.com: la parte pública es nueva
y el área privada —cuentas, reserva de citas y agenda— rehace lo que allí ya existía.

Dos cosas conviven en el mismo sitio y conviene no mezclarlas:

- **El contenido** (fotos, servicios, precios, avisos) vive en **Sanity** y se edita en
  `/admin`, dentro de la propia web.
- **Los datos de personas** (cuentas y citas) viven en **MongoDB Atlas**. No pasan por el
  CMS y no se editan a mano.

---

## Cómo se arranca

```bash
npm install
cp .env.example .env.local     # y se rellena (ver abajo)
npm run db:setup               # índices de Mongo — obligatorio la primera vez
npm run dev
```

Sin `.env.local` la **parte pública funciona igual**: el contenido cae a la copia de
partida de `content/seed.ts` y la portada se sirve sin vídeo. Lo que no funciona sin base
de datos es entrar, reservar y la agenda.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run check` | `tsc --noEmit` + ESLint + Prettier. **Pasa esto antes de commitear** |
| `npm run format` | Aplica Prettier |
| `npm run db:setup` | Crea los índices de Mongo. Idempotente |
| `npm run db:setup -- --admin correo@x.com` | Da papel de administrador a una cuenta ya registrada |
| `npm run hero` | Renderiza el montaje de la portada a partir del material de `.hero-src/` |

---

## Variables de entorno

Todas están explicadas en `.env.example`. Las imprescindibles:

| Variable | Para qué | ¿Secreta? |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Proyecto de Sanity (`qb7n9gwn`) | No |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | No |
| `SANITY_REVALIDATE_SECRET` | Firma el webhook que refresca la web al publicar | **Sí** |
| `MONGODB_URI` | Cuentas y citas | **Sí** |
| `AUTH_SECRET` | Firma las cookies de sesión. **Distinto en cada entorno** | **Sí** |
| `SMTP_HOST` / `PORT` / `USER` / `PASSWORD` | Correo de recuperación de contraseña | La contraseña, sí |

> **`TZ` no se configura.** Es una variable **reservada en Vercel** y el panel rechaza
> crearla. La zona horaria la fija `instrumentation.ts` al arrancar el servidor. Sin eso el
> proceso correría en UTC y en verano la agenda se desplazaría dos horas: la barbería
> abriría a las 11:00 y perdería los dos últimos huecos de la tarde.

---

## Ramas y entornos

| Rama | Proyecto de Vercel | URL | Indexable |
|---|---|---|---|
| `develop` | — (no despliega) | — | — |
| `test` | `milabarbertest` | milabarbertest.vercel.app | **No** |
| `prod` | `milabarber` | milabarber.vercel.app | Sí |
| `claude` | — (no despliega) | Contexto, reglas y memoria de Claude | — |

`develop` y `claude` tienen el despliegue apagado en `vercel.json`. Cada proyecto de test
despliega **su** rama como si fuera producción, así que `VERCEL_ENV` vale `production` en
los dos: por eso `lib/site-env.ts` decide qué se indexa mirando **la rama** y no el
entorno. Sin esa distinción, el dominio de test competiría en Google con el de verdad por
las mismas búsquedas.

Las promociones son `develop → test → prod` con `git merge --no-ff`. **Nunca squash**: crea
SHA nuevos, las ramas dejan de compartir historia y cada promoción reabre conflictos ya
resueltos.

---

## Cómo está montado

- **Next.js 16** (App Router, Turbopack), TypeScript estricto, **Tailwind 4**, **zod**
  validando todo lo que entra —formularios y contenido del CMS—.
- **Auth.js v5** con proveedor de credenciales y **bcrypt** (coste 12). Sesión en JWT.
- **MongoDB** con el controlador oficial, sin ORM.
- **Sanity** como CMS, con el studio embebido en `/admin`.

Tres decisiones que explican casi todo lo demás:

**Una cita es una foto del momento en que se reservó.** El nombre del servicio, su precio y
su duración se copian dentro del documento en vez de guardar sólo el id. Si mañana el corte
sube de 14 a 16 €, la cita de la semana pasada tiene que seguir diciendo 14 € —es lo que se
cobró— y la agenda del jueves tiene que seguir ocupando los 30 minutos con los que se
reservó. Ver `lib/appointments.ts`.

**Reservar ocurre dentro de una transacción.** Entre comprobar que el hueco está libre y
escribir la cita cabe otra reserva. Es raro con dos sillones, pero el día que pasa deja a
dos personas en la puerta a la misma hora, y ésa es la clase de fallo por la que se deja de
usar una web de reservas.

**Si el CMS falla, la web no se cae.** Se registra el error y se sirve la copia de partida.
Aquí el contenido lo edita quien está cortando el pelo entre cliente y cliente; que la
barbería se quede sin web un sábado por un campo mal puesto es peor que enseñar el precio
de la semana pasada.

### Papeles

`client`, `staff` y `admin`. Se dan **a mano** (`npm run db:setup -- --admin correo@x.com`):
que registrarse el primero dé el mando es un agujero clásico en cuanto la web es pública.
`staff` y `admin` ven `/cuenta/agenda`. El papel viaja en el token para decidir qué se
pinta, pero todo lo que toca datos ajenos lo comprueba otra vez contra la base
(`requireStaff` en `lib/session.ts`).

---

## Pendiente

- **Fotos del equipo.** Las fichas de Hassan y Mohammed siguen con el hueco tramado de
  `<Figure>`. Se suben desde `/admin`.
- **Separar la base de datos de test y producción.** Hoy los dos entornos usan la misma
  `MONGODB_URI`, así que una reserva de prueba aparece en la agenda real. Implica tocar
  `DB_NAME` en `lib/db.ts` y dar permiso sobre la segunda base al usuario de Atlas.
- **Dominio.** `prod` sirve en `milabarber.vercel.app`. Migrar milabarberr.com es decisión
  del cliente.

Ya resuelto: correo saliente por Gmail, webhooks de revalidación en los dos entornos, la
galería con trece fotos publicadas en Sanity (seis en la tira de la portada), y el vídeo de
portada.

---

## El vídeo de portada

`public/hero/` lleva el montaje ya renderizado: el bucle de veinte segundos que se ve detrás
del titular, en dos proporciones (apaisada y vertical) y en dos formatos (VP9 para todos,
H.264 para Safari). Unos 15 MB en total. Cómo se reproduce está en
`components/sections/HeroMontage.tsx`; cómo se genera, en `scripts/build-hero-montage.mjs`.

**La materia prima son cinco reels del Instagram de la barbería**
([@milabarber10](https://www.instagram.com/milabarber10)): el local con el techo de LED, el
lavado en el lavacabezas, el peine sobre el pelo rizado, un blanco recién teñido y una
órbita por la pared de producto. Los originales viven en `.hero-src/`, que está en
`.gitignore` — al repositorio sólo va el resultado.

Para volver a montarlo: `npm run hero`. **ffmpeg no hace falta instalarlo**, lo trae el
paquete `ffmpeg-static` con `npm install`.

### Cómo se elige cada plano

El nombre del fichero es el guion, y por eso no hay ninguna lista de planos dentro del
script:

```
.hero-src/01-local-DBrs4yXOFuu@0.mp4     el número decide el orden
.hero-src/03-peine-DBrO86BOmHw@21.mp4    @21 = córtalo a partir del segundo 21
.hero-src/descartados/                   material que no entra (las subcarpetas se ignoran)
```

El `@` existe porque esto son reels, no planos rodados para una portada: de medio minuto hay
unos diez segundos aprovechables y el resto es el cliente mirando a cámara —que detrás de un
titular queda fatal— o un rótulo. Cada plano se come unos 7 s de original; si el corte no
llega, `npm run hero` lo avisa por consola con el nombre delante.

Dos cosas que ya se pagaron eligiendo, y que conviene mirar antes de dar un plano por bueno:

- **Barridos oscuros.** El plano del local empezaba en el segundo 6 y en el 8 hay un barrido
  casi negro, que caía en el primer segundo del bucle: lo primero que se veía al entrar era
  una pantalla vacía. Se arregló moviéndolo a `@0`, que además es el mejor fotograma de todo
  el material. Mismo plano, otro segundo.
- **Marcas de agua.** El reel del degradado traía la de **CapCut** incrustada arriba, justo
  donde el degradado de la portada es más flojo. Ése no tiene arreglo por recorte y está en
  `descartados/`.
