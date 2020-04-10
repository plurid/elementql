import falcon



class ElementQL:
    def on_get(
        self,
        request,
        response,
    ):
        pass

    def on_post(
        self,
        request,
        response
    ):
        pass


api = falcon.API()
api.add_route('/elementql', ElementQL())
