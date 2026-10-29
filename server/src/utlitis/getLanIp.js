import { networkInterfaces } from "node:os";

const getLanIp = (PORT) => {
  const interfaces = networkInterfaces();

  const getIPv4 = (name) =>
    interfaces[name]?.find((item) => item.family === "IPv4" && !item.internal)
      ?.address;

  const ethernetIP = getIPv4("Ethernet");
  const tailscaleIP = getIPv4("Tailscale");

  return {
    ethernet: ethernetIP ? `http://${ethernetIP}:${PORT}/` : null,
    tailscale: tailscaleIP ? `http://${tailscaleIP}:${PORT}/` : null,
    localhost: `http://localhost:${PORT}/`,
    loopback: `http://127.0.0.1:${PORT}/`,
  };
};

export default getLanIp;
