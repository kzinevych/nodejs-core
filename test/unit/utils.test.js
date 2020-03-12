/**
 * @project core-service
 * @author Kostiantyn Zinevych
 * @version 1.0
 * @since 2019-02-21
 */
// ----------utils.it----------

const moment = require('moment');
const chai = require('chai');
const {
  isEmpty,
  fileTypeToMimeType,
  httpMethodToRights,
  httpRightsToMethod,
  millisecondsToExpire,
  listEmailToArray,
} = require('../../server/utils');

const { expect } = chai;

describe('utils.test', () => {
  it('Should contain empty Object', () => {
    expect(isEmpty({})).to.equal(true);
  });

  it('Should return correct mime_types for each extension', () => {
    expect(fileTypeToMimeType('.docx')).to.equal('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(fileTypeToMimeType('.doc')).to.equal('application/msword');
    expect(fileTypeToMimeType('.pdf')).to.equal('application/pdf');
    expect(fileTypeToMimeType('.txt')).to.equal('text/plain');
  });

  it('Should return correct rights for each method', () => {
    expect(httpMethodToRights('GET')).to.equal('read');
    expect(httpMethodToRights('POST')).to.equal('create');
    expect(httpMethodToRights('PUT')).to.equal('update');
    expect(httpMethodToRights('DELETE')).to.equal('delete');
  });

  it('Should return correct methods for each right', () => {
    expect(httpRightsToMethod('read')).to.equal('GET');
    expect(httpRightsToMethod('create')).to.equal('POST');
    expect(httpRightsToMethod('update')).to.equal('PUT');
    expect(httpRightsToMethod('delete')).to.equal('DELETE');
  });

  it('Should return milliseconds to expiration date', () => {
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth();
    const currentDay = (new Date()).getDay();
    const hours = 20;
    const minutes = 0;
    const seconds = 0;
    const milliseconds = 0;
    const currentTime = moment().format('x');
    const expirationDate = moment({
      y: currentYear,
      M: currentMonth,
      d: currentDay,
      h: hours,
      m: minutes,
      s: seconds,
      ms: milliseconds,
    }).format('x');
    const expirationMilliseconds = +(((expirationDate - currentTime) / 1000).toFixed(0));

    expect(millisecondsToExpire(currentYear, currentMonth, currentDay, hours, minutes, seconds, milliseconds))
      .to.equal(expirationMilliseconds);
  });

  it('Should convert list of emails to array of emails', () => {
    const emailsList = 'it1@email.com,it2@email.com,it3@email.com,it4@email.com';
    expect(listEmailToArray(emailsList)).to.eql([
      { email: 'it1@email.com' },
      { email: 'it2@email.com' },
      { email: 'it3@email.com' },
      { email: 'it4@email.com' },
    ]);
  });
});
