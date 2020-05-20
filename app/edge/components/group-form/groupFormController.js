import angular from 'angular';
import _ from 'lodash-es';

class EdgeGroupFormController {
  /* @ngInject */
  constructor(EndpointService, $async, $scope) {
    this.EndpointService = EndpointService;
    this.$async = $async;

    this.endpoints = {
      state: {
        limit: '10',
        filter: '',
        pageNumber: 1,
        totalCount: 0,
      },
      value: null,
    };

    this.associateEndpoint = this.associateEndpoint.bind(this);
    this.dissociateEndpoint = this.dissociateEndpoint.bind(this);
    this.getDynamicEndpointsAsync = this.getDynamicEndpointsAsync.bind(this);
    this.getDynamicEndpoints = this.getDynamicEndpoints.bind(this);

    $scope.$watch(
      () => this.model,
      () => {
        if (this.model.Dynamic) {
          this.getDynamicEndpoints(this.pageType, 'associated');
        }
      },
      true
    );
  }

  associateEndpoint(endpoint) {
    if (!_.includes(this.model.Endpoints, endpoint.Id)) {
      this.model.Endpoints = [...this.model.Endpoints, endpoint.Id];
    }
  }

  dissociateEndpoint(endpoint) {
    this.model.Endpoints = _.filter(this.model.Endpoints, (id) => id !== endpoint.Id);
  }

  getDynamicEndpoints(pageType, tableType) {
    return this.$async(this.getDynamicEndpointsAsync, pageType, tableType);
  }

  async getDynamicEndpointsAsync() {
    const { pageNumber, limit, search } = this.endpoints.state;
    const start = (pageNumber - 1) * limit + 1;
    const query = { search, type: 4, tagIds: this.model.TagIds, tagsPartialMatch: this.model.PartialMatch };

    const response = await this.EndpointService.endpoints(start, limit, query);

    const totalCount = parseInt(response.totalCount, 10);
    this.endpoints.value = response.value;
    this.endpoints.state.totalCount = totalCount;
  }
}

angular.module('portainer.edge').controller('EdgeGroupFormController', EdgeGroupFormController);
export default EdgeGroupFormController;