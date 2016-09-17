import { DistributedVotingPage } from './app.po';

describe('distributed-voting App', function() {
  let page: DistributedVotingPage;

  beforeEach(() => {
    page = new DistributedVotingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
