export interface EmailDto {
  email: string;
  password: string;
  source: string;
  to?: string;
  chatId?: string;
}

export interface DeviceInfo {
  ipAddr: string;
  deviceDetails: string;
  location: string;
}
