//======================================================
//  JWTs Test
//======================================================

import { generateJwt, jwtToken, verifyJwt } from 'util/jwt';

describe('Testing JWTs', () => {
  test('Generating a valid JWT', () => {
    const testToken: string = generateJwt(
      {
        id: 'dsa',
        firstname: 'John',
        surname: 'Costa',
        email: 'john@email.com',
        password: 'HashedPassword',
        profile_picture: 'https://www.google.com/fav.ico',
        salt: 'Salt',
        creation_time: new Date(),
        edit_time: new Date(),
        external_id: '100942069',
        pronouns: 'she/her',
        active: true,
      },
      'ACCESS'
    );

    const verified: jwtToken = verifyJwt(testToken);
    expect(verified.error == null);
  });

  test('Invalid JWT', () => {
    let testToken: string = generateJwt(
      {
        id: 'dsa',
        firstname: 'John',
        surname: 'Costa',
        email: 'john@jwt.testing.com',
        password: 'HashedPassword',
        profile_picture: 'https://www.google.com/fav.ico',
        salt: 'Salt',
        creation_time: new Date(),
        edit_time: new Date(),
        external_id: '100942069',
        pronouns: 'it/its',
        active: true,
      },
      'ACCESS'
    );
    testToken = testToken.substring(1);
    const verified: any = verifyJwt(testToken);
    if (typeof verified == 'object') {
      expect(verified.hello === 'world');
    } else {
      expect(false);
    }
  });
});
