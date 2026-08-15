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
| `dev` | — (no despliega) | — | — |
| `test` | `milabarbertest` | milabarbertest.vercel.app | **No** |
| `prod` | `milabarber` | milabarber.vercel.app | Sí |

`dev` tiene el despliegue apagado en `vercel.json`. Cada proyecto de test
despliega **su** rama como si fuera producción, así que `VERCEL_ENV` vale `production` en
los dos: por eso `lib/site-env.ts` decide qué se indexa mirando **la rama** y no el
entorno. Sin esa distinción, el dominio de test competiría en Google con el de verdad por
las mismas búsquedas.

Las promociones son `dev → test → prod` con `git merge --no-ff`. **Nunca squash**: crea
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
galería por secciones con las veintiocho fotos y los seis vídeos de
[@milabarberr](https://www.instagram.com/milabarberr) publicados en Sanity (seis en la tira
de la portada), y el vídeo de portada.

**La cuenta antigua era [@milabarber10](https://www.instagram.com/milabarber10) y ya no queda
nada suyo**: ni en la galería, ni en el vídeo de portada, ni en `fotos-originales/`. Si
aparece material nuevo, tiene que salir de @milabarberr.

---

## El vídeo de portada

`public/hero/` lleva el montaje ya renderizado: el bucle que se ve detrás del titular, en dos
proporciones (apaisada y vertical) y en dos formatos (VP9 para todos, H.264 para Safari). El
navegador se baja uno solo. Cómo se reproduce está en `components/sections/HeroMontage.tsx`;
cómo se genera, en `scripts/build-hero-montage.mjs`.

**La materia prima son reels de [@milabarberr](https://www.instagram.com/milabarberr)**, y en
el bucle entran cuatro, en este orden: unas trenzas, el peine levantando los rizos, un
desvanecido bajo los neones y —al final— el cliente que se gira y hace el gesto con el brazo.
El resto está en `.hero-src/descartados/`. Los originales viven en `.hero-src/`, que está en
`.gitignore` — al repositorio sólo va el resultado.

**El plano del gesto es el último a propósito.** Es el único con alguien mirando a cámara: de
apertura compite con el titular, y de cierre remata el bucle. Empieza cuando ya está sentado
en el sillón y acaba en cuanto termina el gesto; ni un fotograma más, porque lo que viene
detrás en el reel es otro plano.

Para volver a montarlo: `npm run hero`. **ffmpeg no hace falta instalarlo**, lo trae el
paquete `ffmpeg-static` con `npm install`.

### Cómo se elige cada plano

El nombre del fichero es el guion, y por eso no hay ninguna lista de planos dentro del
script:

```
.hero-src/03-peine-DBrO86BOmHw@21.mp4       el número decide el orden
                                            @21 = córtalo a partir del segundo 21
.hero-src/01-local-DYMkejioVFW@0-7.28.mp4   @0-7.28 = enseña exactamente ese trozo
.hero-src/08-trenzas-DUl7glXCGRc@1.4-4.5=5.mp4
                                            =5 = y estíralo hasta llenar 5 s
.hero-src/descartados/                      material que no entra (las subcarpetas se ignoran)
```

El `@` existe porque esto son reels, no planos rodados para una portada: de medio minuto hay
unos diez segundos aprovechables y el resto es el cliente mirando a cámara —que detrás de un
titular queda fatal— o un rótulo. Cada plano se come unos 7 s de original; si el corte no
llega, `npm run hero` lo avisa por consola con el nombre delante.

**Un `@` con dos números es otra cosa**: `@0-7.28` no dice por dónde empezar sino qué trozo
exacto se ve, y ese plano se lleva el hueco que necesite y va a velocidad natural, sin la
cámara lenta del resto. Existe porque el trozo de apertura son 7,28 s que acaban justo cuando
el cliente hace el gesto con el brazo: metido en el hueco de 5 s del resto de planos se
quedaba a medias, y estirado o encogido dejaba de ser el trozo que se eligió. Un plano largo
alarga el bucle; no desplaza el fundido de los que vienen detrás.

**Y un `=` detrás es la excepción a eso**: `@1.4-4.5=5` son esos 3,1 s exactos puestos a
llenar un hueco de cinco, o sea a 1,61× lento en vez del 1,35× del resto. Es para el reel al
que no se le puede pedir más: cuando el trozo que sirve es más corto que el hueco, la única
forma de que dé un plano de los largos es enseñarlo más despacio.

`npm run hero` también busca los cortes secos de cada reel y avisa de los que caen dentro del
plano, con el tramo seguido más largo que ha encontrado y a partir de qué segundo empieza. Es
sólo un aviso: el guion sigue siendo el nombre del fichero, porque qué segundo es el bueno se
decide mirándolo. Hoy avisa de los tres primeros y del de las trenzas no, que es el único con
el plano elegido justo entre dos cortes; del blanco llega a decir que el reel no da un plano.
Están elegidos a mano y se ven bien, pero conviene saberlo antes de tocarlos, y saber también
que el detector no distingue un barrido de cámara de un corte: parte de esos avisos son
barridos y hay que mirarlos igual.

Cuatro cosas que ya se pagaron eligiendo, y que conviene mirar antes de dar un plano por bueno:

- **Cortes en cadena.** El primer plano era otro reel del local que parecía un plano y era una
  recopilación de antes-y-después: doce cortes secos en catorce segundos, uno por segundo. Los
  siete segundos que se lleva la portada se comían seis de esos cortes, y detrás del titular
  eso no se lee como un montaje sino como que la web se ha quedado colgada y ha pegado un
  salto. No tiene arreglo por recorte —el tramo seguido más largo era de 1,3 s— así que está
  en `descartados/`, y el plano de apertura salió de otro reel del local.
- **Barridos oscuros.** Otro plano del local empezaba en el segundo 6 y en el 8 tenía un
  barrido casi negro, que caía en el primer segundo del bucle: lo primero que se veía al
  entrar era una pantalla vacía. Mismo plano, otro segundo.
- **Marcas de agua.** El reel del degradado traía la de **CapCut** incrustada arriba, justo
  donde el degradado de la portada es más flojo. Ése no tiene arreglo por recorte y está en
  `descartados/`.
- **Pantallas partidas.** El reel de las trenzas está montado a base de zooms de golpe, y en
  los primeros cinco segundos la pantalla está partida en tres bandas con tres planos distintos
  a la vez. A pantalla completa lo más largo que le queda son 2,2 s, y ése fue su plano durante
  un tiempo: con el fundido de entrada comiéndose 1 s del hueco, no se veía. **Su plano son
  ahora las bandas**, que es su único tramo largo: de 1,4 a 4,5 —antes de 1,4 la banda de abajo
  todavía está en negro y en 4,6 entra un corte— estirados al hueco de 5 s (`@1.4-4.5=5`).
  Ojo: **eso sólo se ve en vertical**. El recorte a 16:9 de la variante apaisada se queda con la
  banda del medio y las otras dos se van fuera, así que en escritorio ese plano se lee como un
  plano normal de una nuca.
