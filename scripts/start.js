import { createServer } from 'http-server';
import getPort from 'get-port';
import open from 'open';

async function start() {
  // Ports à tester en priorité, sinon port libre quelconque
  const port = await getPort({ port: [8080, 8081, 8082, 0] });
  const host = '127.0.0.1';

  const server = createServer({
    cache: -1,
    root: '.',
  });

  server.listen(port, host, () => {
    const url = `http://${host}:${port}/index.html`;
    console.log(`Serveur prêt sur ${url}`);
    // Ouvrir le navigateur ; en cas d'échec, on laisse le serveur tourner
    open(url).catch(() => {});
  });
}

start().catch((err) => {
  console.error('Erreur au démarrage du serveur :', err);
  process.exit(1);
});

