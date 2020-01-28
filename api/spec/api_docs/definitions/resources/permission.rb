module ApiDocs
  module Definitions
    module Resources
      class Permission

        REQUIRED_CREATE_ATTRIBUTES = [:role_names].freeze

        class << self
          include ApiDocs::Definitions::Resource
        end
      end
    end
  end
end
