module Entitlements
  # Create an Entitlement
  class Create < ActiveInteraction::Base
    isolatable!

    transactional!

    object :entitling_entity, class: "Concerns::ProvidesEntitlements"

    record :subject_url, class: "GlobalID", finder: :new

    record :target_url, class: "GlobalID", finder: :new

    hash :global_roles, default: proc { {} } do
      boolean :subscriber, default: false
    end

    hash :scoped_roles, default: proc { {} } do
      boolean :read_access, default: false
    end

    validate :find_entitler!
    validate :find_subject!
    validate :find_target!

    # @return [Entitlement]
    def execute
      @entitlement = entitler.entitlements.build subject: subject, target: target
      @entitlement.assign_attributes inputs.slice(:global_roles, :scoped_roles)

      persist_model! entitlement, assimilate: true
    end

    attr_reader :entitlement
    attr_reader :entitler
    attr_reader :subject
    attr_reader :target

    private

    # @return [void]
    def find_entitler!
      entitling_entity.to_upsertable_entitler.then do |entitler|
        entitler.upsert!

        @entitler = entitler
      end
    end

    # @return [void]
    # rubocop:disable Metrics/AbcSize
    def find_subject!
      if subject_url.app.to_s != "entitlements"
        errors.add :subject_url, "must be gid://entitlements"

        return
      end

      @subject = subject_url.find
    rescue ActiveRecord::RecordNotFound => e
      errors.add :subject_url, e.message
    else
      errors.add :subject_url, "does not correspond to a known subject" if @subject.blank?
      errors.add :subject_url, "is not entitleable" unless @subject.kind_of?(Concerns::Entitleable)
    end
    # rubocop:enable Metrics/AbcSize

    # @return [void]
    def find_target!
      @target = target_url.find
    rescue ActiveRecord::RecordNotFound => e
      errors.add :target_url, e.message
    else
      errors.add :target_url, "does not correspond to a known target" if @target.blank?
      errors.add :target_url, "cannot receive entitlements" unless @target.kind_of?(Concerns::ReceivesEntitlements)
    end
  end
end
