module Entitlements
  class AuditJob < ApplicationJob
    queue_as :default

    # @return [void]
    def perform
      result = ::Container["entitlements.audit.perform"].call

      match_result_on_failure result do |(code, reason)|
        raise "Failed Audit: #{code.inspect} because #{reason}"
      end
    end
  end
end
