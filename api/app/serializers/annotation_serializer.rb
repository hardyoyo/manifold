# Serializes an Annotation model
class AnnotationSerializer < ActiveModel::Serializer
  include Authorization
  meta(partial: false)

  has_one :creator
  attributes :created_at, :end_char, :end_node, :id, :start_char, :start_node,
             :text_section_id, :updated_at, :format,
             :resource_id, :creator_id, :body, :private, :subject,
             :current_user_is_creator, :can_update_object,
             :can_delete_object, :comments_count, :collection_id

  def current_user_is_creator
    return false unless current_user
    return false unless object.creator_id
    current_user.id == object.creator_id
  end

end
