const request = require('request-promise-native').defaults({
  jar: true,
  gzip: true,
  baseUrl: 'http://turbosms.in.ua/api/soap.html',
});

exports.auth = async (login, password) => {
  const body = `<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tur="http://turbosms.in.ua/api/Turbo">
    <x:Header/>
      <x:Body>
          <tur:Auth>
              <tur:login>${login}</tur:login>
              <tur:password>${password}</tur:password>
          </tur:Auth>
      </x:Body>
    </x:Envelope>`;
  const res = await request.post('', {
    body,
  });
  const re = /<ns1:AuthResult>(.+)<\/ns1:AuthResult>/m;
  const match = re.exec(res);
  let authResult = '';
  // eslint-disable-next-line prefer-destructuring
  if (match) authResult = match[1];
  return authResult;
};

exports.balance = async () => {
  const body = `<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tur="http://turbosms.in.ua/api/Turbo">
        <x:Header/>
        <x:Body>
            <tur:GetCreditBalance></tur:GetCreditBalance>
        </x:Body>
        </x:Envelope>`;
  let balance = 0;
  const res = await request.post('', {
    body,
  });

  const re = /<ns1:GetCreditBalanceResult>(.+)<\/ns1:GetCreditBalanceResult>/m;
  const match = re.exec(res);
  if (match) {
    balance = parseFloat(match[1]);
  }
  return balance;
};

exports.sendSMS = async (sender, number, message) => {
  // number: номер в полном формате 380XXXXXXXXX
  const body = `<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tur="http://turbosms.in.ua/api/Turbo">
        <x:Header/>
            <x:Body>
                <tur:SendSMS>
                    <tur:sender>${sender}</tur:sender>
                    <tur:destination>${number}</tur:destination>
                    <tur:text>${message}</tur:text>
                </tur:SendSMS>
            </x:Body>
        </x:Envelope>`;

  const soapAnswer = await request.post('', {
    body,
  });

  const re = /<ns1:ResultArray>(.*?)<\/ns1:ResultArray>/gm;
  let result;
  const results = [];

  // eslint-disable-next-line no-cond-assign
  while ((result = re.exec(soapAnswer))) {
    results.push(result[1]);
  }

  return results;
};
