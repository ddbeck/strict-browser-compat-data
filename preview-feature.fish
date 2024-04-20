#!/usr/bin/env fish

set group $argv[1]
set options $argv[2..]
set yml ../web-platform-dx-web-features/feature-group-definitions/$group.yml

function read_feature
    yq '.' $yml
end

function read_compat_features
    yq '{ "compat_features": .compat_features }' $yml
end

function preview_status
    read_feature | yq -o=json '.compat_features' | jq --raw-output '.[]' | xargs npx tsx ./scripts/baseline/ --group-as=$group --markdown
end

preview_status
