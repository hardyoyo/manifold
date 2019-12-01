module V1
  class TextCategorySerializer < ManifoldSerializer

    include ::V1::Concerns::ManifoldSerializer
    include V1::Concerns::WithAbilities

    attributes :id,
               :title,
               :position

  end
end
