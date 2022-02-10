export enum ContainerStates {
  RUNNING = 'running',
}

export type Mount = {
  Type: string;
  Source: string;
  Destination: string;
  Mode: string;
  RW: boolean;
  Propagation: string;
};

export type Port = {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  type: 'tcp' | 'udp';
};

export type RawContainer = {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  Ports: Port[];
  Labels: Record<string, string>;
  State: ContainerStates;
  Status: string;
  HostConfig: {
    NetworkMode: string;
  };
  NetworkSettings: unknown;
  Mounts: Mount[];
};
