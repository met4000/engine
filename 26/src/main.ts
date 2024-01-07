import { stdin, stdout } from "process";

const getNextInput = () => new Promise<Buffer>(resolve => stdin.once("data", data => resolve(data)));

while (true) {
  const data = await getNextInput();

  stdout.write(data);
}
