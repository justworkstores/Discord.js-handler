export default {
  name: 'ready',
  once: true,
  async execute(client) {
    globalThis.__client = client; // ensure handlers can access full client once ready
    console.log(`✅ Ready! Logged in as ${client.user.tag}`);
  }
};
