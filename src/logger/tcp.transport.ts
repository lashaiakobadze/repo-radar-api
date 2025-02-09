import * as Transport from 'winston-transport';
import * as net from 'net';

interface TcpTransportOptions extends Transport.TransportStreamOptions {
  host: string;
  port: number;
}

export class TcpTransport extends Transport {
  private socket: net.Socket;
  private host: string;
  private port: number;

  constructor(opts: TcpTransportOptions) {
    super(opts);
    this.host = opts.host;
    this.port = opts.port;
    this.socket = new net.Socket();

    this.socket.connect(this.port, this.host, () => {
      console.log(`Connected to Logstash at ${this.host}:${this.port}`);
    });

    this.socket.on('error', (err) => {
      console.error('Logstash TCP transport error', err);
    });
  }

  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    const message = JSON.stringify({
      level: info.level,
      timestamp: new Date().toISOString(),
      message: info.message,
      context: info.context || null,
      ...info.meta,
    });

    if (this.socket && !this.socket.destroyed) {
      this.socket.write(`${message}\n`);
    }

    callback();
  }
}
