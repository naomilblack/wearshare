var app = angular.module("outfitApp");

// Controller for Wardrobe Screen
app.controller("wardrobeCtrl", function ($scope, profileService, $q, $routeParams, FileUploader) {
	$scope.articles;
	$scope.article = {};
	$scope.id=$routeParams.user_id || 1;
	$scope.avswitch = 1;
	$scope.outfit = {
		topArticle : null,
		bottomArticle : null,
		shoes : null
	};
	$scope.homeOrNo = 1;
	$scope.procOutfit='#!/profile/outfits';
	$scope.procWardrobe='#!/profile/wardrobe';
	$scope.preview=false;

	if ($routeParams.user_id) {
		$scope.homeOrNo = 0;
		$scope.procOutfit = '#!/profile/' + $routeParams.user_id + '/outfits';
		$scope.procWardrobe = '#!/profile/' + $routeParams.user_id + '/wardrobe';
	}

	$scope.getArticles = function () {

		var promise = profileService.getArticles($scope.id);

		promise.then(function (articles) {
			$scope.articles = articles;
			console.log($scope.articles);
		});
	};

	$scope.postArticle = function () {
		var submitted = JSON.stringify($scope.article);
		console.log(submitted);
		profileService.postArticle(submitted);
	};

	$scope.switchView = function (view) {
		$scope.avswitch = view;
	}

	$scope.uploader = new FileUploader({
		url: '/users/' + $scope.id + '/articles'
	});
	
	$scope.uploader.onBeforeUploadItem = function ( item ) {
		console.log('onBeforeUploadItem', item);
    	item.formData = [{ article_type: $scope.article.article_type, article_name: $scope.article.article_name }];
	};

	$scope.togglePreview = function () {
		$scope.outfit = {
			topArticle : null,
			bottomArticle : null,
			shoes : null
		};

		if ($scope.preview) {
			$scope.preview=false;
		} else $scope.preview=true;
	}

	$scope.select = function (article) {

		if (article.article_type === "top") {
			$scope.outfit.topArticle = article;
		} else if (article.article_type === "bottom") {
			$scope.outfit.bottomArticle = article;
		} else if (article.article_type === "shoes") {
			$scope.outfit.shoes = article;
		}
	};

	$scope.getArticles();
});