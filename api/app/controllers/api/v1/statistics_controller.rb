module API
  module V1
    # Statistics controller
    class StatisticsController < ApplicationController
      # require_dependency Rails.root.join("app", "lib", "statistics.rb")

      #resourceful! Statistics do
        #Statistics.new
      #end

      def show
        expires_in 3.hours, public: true
        render_single_resource Statistics.new,
                               serializer: ::V1::StatisticsSerializer,
                               location: "[:api, :v1, :statistics]"
      end

    end
  end
end
