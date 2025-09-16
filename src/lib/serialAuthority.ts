
export class SerialAuthority {
  currentSerial = 0;
  next() {
    return this.currentSerial++;
  }
}
