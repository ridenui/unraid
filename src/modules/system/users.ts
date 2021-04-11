import { execute } from '../../ssh/SSH';

const regex = /(.*):(.*):(.*):(.*):(.*):(.*):(.*)/g;

type IUsersResult = {
  raw: string;
  username: string;
  password: string;
  uid: string;
  gid: string;
  fullName: string;
  home: string;
  shell: string;
};

async function users(): Promise<IUsersResult[]> {
  const { code, stdout } = await execute('cat /etc/passwd');
  if (code !== 0) throw new Error('Got non-zero exit code while listing users');
  const result = [];
  stdout.forEach((user) => {
    regex.lastIndex = 0;
    const [input, username, password, uid, gid, fullName, home, shell] = regex.exec(user);
    result.push({
      raw: input,
      username,
      password,
      uid,
      gid,
      fullName,
      home,
      shell,
    });
  });
  return result;
}

export { users };
