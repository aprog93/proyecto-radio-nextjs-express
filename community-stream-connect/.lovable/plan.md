
# Integrar AzuraCast Demo con Variables de Entorno

## Resumen
Conectar la aplicacion con la API publica de AzuraCast (demo: `https://demo.azuracast.com`) para obtener datos en tiempo real: cancion actual, caratula, oyentes, historial y stream de audio. Todas las URLs seran configurables mediante variables de entorno de Vite.

## Variables de Entorno

Crear un archivo `.env` con las siguientes variables (modificables para apuntar a cualquier instancia de AzuraCast):

```text
VITE_AZURACAST_BASE_URL=https://demo.azuracast.com
VITE_AZURACAST_STATION_ID=1
VITE_AZURACAST_POLLING_INTERVAL=15000
```

## Cambios por Archivo

### 1. Nuevo: `src/lib/azuracast.ts`
Modulo centralizado para la API de AzuraCast:
- Leer las variables de entorno (`VITE_AZURACAST_BASE_URL`, `VITE_AZURACAST_STATION_ID`)
- Exportar constantes: `API_BASE`, `STATION_ID`, `STREAM_URL` (construida desde la respuesta de la API)
- Definir tipos TypeScript que mapean la respuesta de `/api/nowplaying/{station_id}` (song, station, listeners, live, playing_next, song_history)
- Funcion `fetchNowPlaying()` que hace fetch al endpoint y retorna los datos tipados
- Intervalo de polling configurable via `VITE_AZURACAST_POLLING_INTERVAL` (default 15s)

### 2. Modificar: `src/context/PlayerContext.tsx`
- Importar `fetchNowPlaying` y tipos desde `azuracast.ts`
- Reemplazar los datos estaticos por un `useEffect` con polling que llama a `fetchNowPlaying()` cada N segundos
- Actualizar el estado `nowPlaying` con datos reales: titulo, artista, album, URL de caratula, conteo de oyentes, estado de live
- Guardar la `streamUrl` (listen_url de la estacion) en el estado
- Asignar `streamUrl` como `src` del elemento `<audio>` para que el streaming funcione de verdad
- Exponer tambien `songHistory`, `playingNext` y `streamUrl` en el contexto
- Actualizar la interfaz `NowPlaying` para incluir `elapsed`, `duration`, `album`

### 3. Modificar: `src/components/PersistentPlayer.tsx`
- Consumir los nuevos datos del contexto (caratula real, titulo real, artista real)
- Sin cambios estructurales significativos -- los datos ya se leen de `nowPlaying`, solo se actualizaran automaticamente

### 4. Modificar: `src/pages/NowPlaying.tsx`
- Mostrar informacion adicional: album, cancion siguiente (`playingNext`)
- Agregar seccion de historial de canciones recientes (`songHistory`) con caratulas
- Mostrar barra de progreso usando `elapsed` y `duration`

### 5. Nuevo: `.env` (archivo de configuracion)
Archivo con valores por defecto apuntando a la demo.

## Datos que se obtienen de la API

De `GET /api/nowplaying/1`:

| Campo | Uso |
|---|---|
| `station.listen_url` | URL del stream de audio |
| `now_playing.song.title` | Titulo de la cancion |
| `now_playing.song.artist` | Artista |
| `now_playing.song.art` | URL de la caratula |
| `now_playing.song.album` | Album |
| `now_playing.elapsed` / `duration` | Progreso de la cancion |
| `listeners.total` | Conteo de oyentes |
| `live.is_live` | Si hay streamer en vivo |
| `playing_next.song` | Siguiente cancion |
| `song_history` | Historial reciente |

## Detalles Tecnicos

- Se usa polling con `setInterval` + `fetch` en lugar de WebSockets para simplicidad y compatibilidad
- El polling se limpia con el cleanup del `useEffect`
- Las variables de entorno usan el prefijo `VITE_` para ser accesibles en el frontend (requisito de Vite)
- El stream de audio se conecta directamente al mount point MP3 de la estacion
- No se necesitan dependencias adicionales
