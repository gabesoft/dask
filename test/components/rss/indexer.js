'use strict';

const computePostTags = require('../../../components/rss/indexer').computePostTags,
      expect = require('chai').expect;

describe('indexer @simple', () => {
  describe('computePostTags', () => {
    it('removes removed tags', () => {
      const tags = computePostTags(['a', 'b'], ['a', 'b', 'c'], ['a', 'c']);
      expect(tags).to.have.members(['a', 'b']);
    });

    it('adds added tags', () => {
      const tags = computePostTags(['a', 'b', 'c'], [], ['x']);
      expect(tags).to.have.members(['a', 'b', 'c', 'x']);
    });
  });
});
